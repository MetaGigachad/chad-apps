package utils

import (
	. "github.com/MetaGigachad/chad-apps/libraries/go_common/pkg/log"
    "github.com/cenkalti/backoff/v4"
)

func Must(err error) {
    if err != nil {
        Log.Fatalf("Must failed with error: %v", err)
    }
}

func Must1[T any](val T, err error) T {
    if err != nil {
        Log.Fatalf("Must1 failed with error: %v", err)
    }
    return val
}

func Must2[T1 any, T2 any](val1 T1, val2 T2, err error) (T1, T2) {
    if err != nil {
        Log.Fatalf("Must2 failed with error: %v", err)
    }
    return val1, val2
}

func ExpRetry(fn func() error) {
    backoff.Retry(func() error {
        err := fn()
        if err != nil {
            Log.Debugf("Retry failed with error: %v", err)
        }
        return err
    }, backoff.NewExponentialBackOff())
}

