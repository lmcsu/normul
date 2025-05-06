import type { ParseContext, Simplify } from '../../types.js';
import { Schema } from '../Schema.js';
import { ObjectSchema } from './ObjectSchema.js';

type InferUnion<T extends Schema[]> =
    Simplify<T[number] extends Schema<infer U> ? U : never>;

interface Candidate<T extends Schema[]> {
    data: InferUnion<T>;
    ctx: ParseContext;
}

export class UnionSchema<T extends [Schema, ...Schema[]]> extends Schema<InferUnion<T>> {
    constructor(
        protected readonly schemas: T,
    ) { super(); }

    protected _parse(input: unknown, ctx: ParseContext): InferUnion<T> {
        const find = (input: unknown): Candidate<T> => {
            const candidates: Candidate<T>[] = [];

            for (const schema of this.schemas) {
                const innerCtx: ParseContext = {
                    issues: [],
                    path: [],
                };

                const data = this.invokeParse(schema, input, innerCtx) as InferUnion<T>;

                if (innerCtx.issues.length === 0) {
                    return {
                        data,
                        ctx: innerCtx,
                    };
                }

                candidates.push({
                    data,
                    ctx: innerCtx,
                });
            }

            let maxDepth = 0;
            for (const candidate of candidates) {
                maxDepth = Math.max(maxDepth, candidate.ctx.path.length);
            }

            let remaining = candidates;
            for (let level = 0; level <= maxDepth; level++) {
                const counts = remaining.map((candidate) => {
                    return candidate.ctx.issues.filter(issue => issue.path.length === level).length;
                });

                const minCount = Math.min(...counts);

                remaining = remaining.filter((_, i) => counts[i] === minCount);

                if (remaining.length === 1) {
                    return remaining[0]!;
                }
            }

            return remaining[0]!;
        };

        const candidate = find(input);

        ctx.issues.push(...candidate.ctx.issues.map(issue => ({
            ...issue,
            path: [...ctx.path, ...issue.path],
        })));

        return candidate.data;
    }
}

export class DiscriminatedUnionSchema<T extends [Schema, ...Schema[]]> extends UnionSchema<T> {
    constructor(
        protected readonly discriminator: string,
        schemas: T,
    ) { super(schemas); }

    protected _parse(input: unknown, ctx: ParseContext): InferUnion<T> {
        for (const schema of this.schemas) {
            if (schema instanceof ObjectSchema) {
                const pickedSchema = schema.pick([this.discriminator]);

                const innerCtx: ParseContext = {
                    issues: [],
                    path: [],
                };

                const data = this.invokeParse(pickedSchema, input, innerCtx);

                if (
                    innerCtx.issues.length === 0 &&
                    this.discriminator in data
                ) {
                    return this.invokeParse(schema, input, ctx) as InferUnion<T>;
                }
            }
        }

        return super._parse(input, ctx);
    }
}
