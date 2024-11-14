export interface TransformationOptions {
    sum?: boolean;
    statisticalSummaries?: boolean;
}

export const defaultTransformationOptions: TransformationOptions = {
    sum: false,
    statisticalSummaries: false,
}