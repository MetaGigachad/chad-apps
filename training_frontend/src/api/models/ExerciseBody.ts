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
import type { MuscleGroup } from './MuscleGroup';
import {
    MuscleGroupFromJSON,
    MuscleGroupFromJSONTyped,
    MuscleGroupToJSON,
    MuscleGroupToJSONTyped,
} from './MuscleGroup';

/**
 * 
 * @export
 * @interface ExerciseBody
 */
export interface ExerciseBody {
    /**
     * 
     * @type {string}
     * @memberof ExerciseBody
     */
    name: string;
    /**
     * 
     * @type {boolean}
     * @memberof ExerciseBody
     */
    bodyWeight: boolean;
    /**
     * 
     * @type {Array<MuscleGroup>}
     * @memberof ExerciseBody
     */
    muscleGroups: Array<MuscleGroup>;
}

/**
 * Check if a given object implements the ExerciseBody interface.
 */
export function instanceOfExerciseBody(value: object): value is ExerciseBody {
    if (!('name' in value) || value['name'] === undefined) return false;
    if (!('bodyWeight' in value) || value['bodyWeight'] === undefined) return false;
    if (!('muscleGroups' in value) || value['muscleGroups'] === undefined) return false;
    return true;
}

export function ExerciseBodyFromJSON(json: any): ExerciseBody {
    return ExerciseBodyFromJSONTyped(json, false);
}

export function ExerciseBodyFromJSONTyped(json: any, ignoreDiscriminator: boolean): ExerciseBody {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'],
        'bodyWeight': json['bodyWeight'],
        'muscleGroups': ((json['muscleGroups'] as Array<any>).map(MuscleGroupFromJSON)),
    };
}

export function ExerciseBodyToJSON(json: any): ExerciseBody {
    return ExerciseBodyToJSONTyped(json, false);
}

export function ExerciseBodyToJSONTyped(value?: ExerciseBody | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'name': value['name'],
        'bodyWeight': value['bodyWeight'],
        'muscleGroups': ((value['muscleGroups'] as Array<any>).map(MuscleGroupToJSON)),
    };
}

