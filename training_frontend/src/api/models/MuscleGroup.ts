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


/**
 * 
 * @export
 */
export const MuscleGroup = {
    Chest: 'chest',
    Back: 'back',
    Abs: 'abs',
    Shoulders: 'shoulders',
    Biceps: 'biceps',
    Triceps: 'triceps',
    Forearms: 'forearms',
    Quadriceps: 'quadriceps',
    Hamstrings: 'hamstrings',
    Calves: 'calves'
} as const;
export type MuscleGroup = typeof MuscleGroup[keyof typeof MuscleGroup];


export function instanceOfMuscleGroup(value: any): boolean {
    for (const key in MuscleGroup) {
        if (Object.prototype.hasOwnProperty.call(MuscleGroup, key)) {
            if (MuscleGroup[key as keyof typeof MuscleGroup] === value) {
                return true;
            }
        }
    }
    return false;
}

export function MuscleGroupFromJSON(json: any): MuscleGroup {
    return MuscleGroupFromJSONTyped(json, false);
}

export function MuscleGroupFromJSONTyped(json: any, ignoreDiscriminator: boolean): MuscleGroup {
    return json as MuscleGroup;
}

export function MuscleGroupToJSON(value?: MuscleGroup | null): any {
    return value as any;
}

export function MuscleGroupToJSONTyped(value: any, ignoreDiscriminator: boolean): MuscleGroup {
    return value as MuscleGroup;
}

