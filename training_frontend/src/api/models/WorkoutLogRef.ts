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
 * @interface WorkoutLogRef
 */
export interface WorkoutLogRef {
    /**
     * 
     * @type {string}
     * @memberof WorkoutLogRef
     */
    id: string;
}

/**
 * Check if a given object implements the WorkoutLogRef interface.
 */
export function instanceOfWorkoutLogRef(value: object): value is WorkoutLogRef {
    if (!('id' in value) || value['id'] === undefined) return false;
    return true;
}

export function WorkoutLogRefFromJSON(json: any): WorkoutLogRef {
    return WorkoutLogRefFromJSONTyped(json, false);
}

export function WorkoutLogRefFromJSONTyped(json: any, ignoreDiscriminator: boolean): WorkoutLogRef {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
    };
}

export function WorkoutLogRefToJSON(json: any): WorkoutLogRef {
    return WorkoutLogRefToJSONTyped(json, false);
}

export function WorkoutLogRefToJSONTyped(value?: WorkoutLogRef | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
    };
}

