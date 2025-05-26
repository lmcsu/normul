import type { ParseContext, Simplify } from '../../types.js';
import { Schema } from '../Schema.js';
import { ObjectSchema, type ExtractShape, type Shape } from './ObjectSchema.js';

type InferUnion<T extends Schema[]> =
    Simplify<T[number] extends Schema<infer U> ? U : never>;

interface Candidate<T extends Schema[]> {
    data: InferUnion<T>;
    ctx?: ParseContext;
}

export class UnionSchema<T extends [Schema, ...Schema[]]> extends Schema<InferUnion<T>> {
    constructor(
        protected readonly schemas: T,
    ) { super(); }

    protected _normalize(input: unknown, ctx: ParseContext): InferUnion<T> {
        const find = (input: unknown): Candidate<T> => {
            const candidates: Candidate<T>[] = [];

            for (const schema of this.schemas) {
                const innerCtx: ParseContext = {
                    issues: [],
                    path: [],
                };

                const data = this.invokeNormalize(schema, input, innerCtx) as InferUnion<T>;

                if (innerCtx.issues.filter(issue => issue.level !== 'info').length === 0) {
                    return {
                        data,
                    };
                }

                candidates.push({
                    data,
                    ctx: innerCtx,
                });
            }

            let maxDepth = 0;
            for (const candidate of candidates) {
                maxDepth = Math.max(maxDepth, candidate.ctx!.path.length);
            }

            let remaining = candidates;
            for (let level = 0; level <= maxDepth; level++) {
                const counts = remaining.map((candidate) => {
                    return candidate.ctx!.issues.filter((issue) => {
                        return (
                            issue.level !== 'info' &&
                            issue.path.length === level
                        );
                    }).length;
                });

                const minCount = Math.min(...counts);

                remaining = remaining.filter((_, i) => counts[i] === minCount);

                if (remaining.length === 1) {
                    this.makeIssue({
                        ctx,
                        message: 'Found the most suitable schema in union',
                        level: 'info',
                    });

                    return remaining[0]!;
                }
            }

            this.makeIssue({
                ctx,
                message: 'Multiple most suitable schemas found in union, taking the first one',
                level: 'warn',
            });

            return remaining[0]!;
        };

        const candidate = find(input);

        if (candidate.ctx) {
            ctx.issues.push(...candidate.ctx.issues.map(issue => ({
                ...issue,
                path: [...ctx.path, ...issue.path],
            })));
        }

        return candidate.data;
    }

    protected override cloneArgs(): unknown[] {
        return [this.schemas];
    }
}

export class DiscriminatedUnionSchema<
    T extends [ObjectSchema<Shape>, ...ObjectSchema<Shape>[]],
    D extends Extract<keyof ExtractShape<T[number]>, string>,
> extends UnionSchema<T> {
    constructor(
        protected readonly discriminator: D,
        protected readonly schemas: T,
    ) { super(schemas); }

    protected _normalize(input: unknown, ctx: ParseContext): InferUnion<T> {
        for (const schema of this.schemas) {
            if (schema instanceof ObjectSchema) {
                const pickedSchema = schema.pick([this.discriminator]);

                const innerCtx: ParseContext = {
                    issues: [],
                    path: [],
                };

                this.invokeNormalize(pickedSchema, input, innerCtx);

                if (innerCtx.issues.filter(issue => issue.level !== 'info').length === 0) {
                    return this.invokeNormalize(schema, input, ctx) as InferUnion<T>;
                }
            }
        }

        this.makeIssue({
            ctx,
            message: 'No matching schema found in discriminated union, falling back to regular union',
            level: 'warn',
        });

        return super._normalize(input, ctx);
    }

    protected override cloneArgs(): unknown[] {
        return [this.discriminator, this.schemas];
    }
}
