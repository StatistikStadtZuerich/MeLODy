/**
 * @swagger
 * components:
 *   schemas:
 *     ResultType:
 *       type: object
 *       properties: {}
 *       additionalProperties:
 *         type: object
 *         properties: {}
 *         additionalProperties:
 *           type: number
 *
 *     ResultTypeWithArrays:
 *       type: object
 *       properties: {}
 *       additionalProperties:
 *         type: object
 *         properties: {}
 *         additionalProperties:
 *           type: array
 *           items:
 *             type: number
 *
 *     ResultTypeWithMatrix:
 *       type: object
 *       properties: {}
 *       additionalProperties:
 *         type: object
 *         properties: {}
 *         additionalProperties:
 *           type: array
 *           items:
 *             type: array
 *             items:
 *               type: number
 */

export type ResultType = Record<string, Record<string, number>>;

export type ResultTypeWithArrays = Record<string, Record<string, number[]>>;

export type ResultTypeWithMatrix = Record<string, Record<string, number[][]>>;
