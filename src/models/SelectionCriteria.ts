/**
 * @swagger
 * components:
 *   schemas:
 *     SelectionCriteria:
 *       type: object
 *       properties:
 *         sortBy:
 *           type: string
 *           description: Field to sort by
 *         sortAsc:
 *           type: boolean
 *           description: Sort in ascending order
 *         limit:
 *           type: integer
 *           description: Limit the number of results
 *         offset:
 *           type: integer
 *           description: Offset the results by a certain number
 */
export interface SelectionCriteria<T> {
    sortBy?: keyof T;
    sortAsc?: boolean;
    limit?: number;
    offset?: number;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     SimpleSelectionCriteria:
 *       type: object
 *       properties:
 *         sortAsc:
 *           type: boolean
 *           description: Sort in ascending order
 */
export interface SimpleSelectionCriteria {
    sortAsc?: boolean;
}