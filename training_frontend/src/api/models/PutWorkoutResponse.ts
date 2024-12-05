/* tslint:disable */
/* eslint-disable */
/**
 * Training service
 * Backend for training app
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface PutWorkoutResponse
 */
export interface PutWorkoutResponse {
    /**
     * 
     * @type {number}
     * @memberof PutWorkoutResponse
     */
    editedAt: number;
}

/**
 * Check if a given object implements the PutWorkoutResponse interface.
 */
export function instanceOfPutWorkoutResponse(value: object): value is PutWorkoutResponse {
    if (!('editedAt' in value) || value['editedAt'] === undefined) return false;
    return true;
}

export function PutWorkoutResponseFromJSON(json: any): PutWorkoutResponse {
    return PutWorkoutResponseFromJSONTyped(json, false);
}

export function PutWorkoutResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): PutWorkoutResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'editedAt': json['editedAt'],
    };
}

export function PutWorkoutResponseToJSON(json: any): PutWorkoutResponse {
    return PutWorkoutResponseToJSONTyped(json, false);
}

export function PutWorkoutResponseToJSONTyped(value?: PutWorkoutResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'editedAt': value['editedAt'],
    };
}
