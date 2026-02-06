import { z } from 'zod';
import type { JSONSchema } from '../types/index';

export type ToolHandler = (args: unknown) => Promise<unknown>;

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodType<unknown>;
  handler: ToolHandler;
}

export function zodToJsonSchema(zodSchema: z.ZodType<unknown>): JSONSchema {
  // Handle ZodObject
  if (zodSchema instanceof z.ZodObject) {
    const shape = zodSchema.shape;
    const properties: Record<string, JSONSchema> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodTypeToJsonSchema(value as z.ZodType<unknown>);
      // Check if field is required (not optional)
      if (!(value instanceof z.ZodOptional)) {
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
    };
  }

  return zodTypeToJsonSchema(zodSchema);
}

function zodTypeToJsonSchema(schema: z.ZodType<unknown>): JSONSchema {
  if (schema instanceof z.ZodString) {
    return { type: 'string' };
  }
  if (schema instanceof z.ZodNumber) {
    return { type: 'number' };
  }
  if (schema instanceof z.ZodBoolean) {
    return { type: 'boolean' };
  }
  if (schema instanceof z.ZodArray) {
    return {
      type: 'array',
      items: zodTypeToJsonSchema(schema.element),
    };
  }
  if (schema instanceof z.ZodOptional) {
    return zodTypeToJsonSchema(schema.unwrap());
  }
  if (schema instanceof z.ZodNullable) {
    return zodTypeToJsonSchema(schema.unwrap());
  }
  if (schema instanceof z.ZodDefault) {
    return zodTypeToJsonSchema(schema.removeDefault());
  }

  return { type: 'object' };
}
