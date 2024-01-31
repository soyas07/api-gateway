import createCircuitBreaker from "../src/middlewares/circuitBreaker.js";

describe('Circuit Breaker', () => {
    // Mocking an asynchronous function that can be used as an action in execute
    const mockAction = async () => {
        // Simulating a successful operation
        return 'Success';
    };

    // Mocking a failed asynchronous function that can be used as an action in execute
    const mockFailedAction = async () => {
        // Simulating a failed operation
        throw new Error('Mocked Failure');
    };

    // Mocking a function with a delayed asynchronous operation
    const mockDelayedAction = async () => {
        return new Promise((resolve) => {
        setTimeout(() => {
            resolve('Success');
        }, 100);
        });
    };

    it('should execute action successfully in closed state', async () => {
        const circuitBreaker = createCircuitBreaker();

        const result = await circuitBreaker.execute(mockAction);
        expect(result).toEqual('Success');
    });

    it('should transition to open state after repeated failures', async () => {
        const circuitBreaker = createCircuitBreaker(3, 5000, 3000, 2);

        // Force the circuit breaker into the open state
        await circuitBreaker.execute(mockFailedAction);
        await circuitBreaker.execute(mockFailedAction);
        await circuitBreaker.execute(mockFailedAction);

        // Attempting another action should result in a circuit open error
        await expect(circuitBreaker.execute(mockAction)).rejects.toThrow('Circuit is open. Try again later.');
    });

    it('should transition to half-open state after resetTimeout', async () => {
        const circuitBreaker = createCircuitBreaker(3, 5000, 3000, 2);

        // Force the circuit breaker into the open state
        await circuitBreaker.execute(mockFailedAction);
        await circuitBreaker.execute(mockFailedAction);
        await circuitBreaker.execute(mockFailedAction);

        // Wait for resetTimeout duration
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Attempting another action should allow it in the half-open state
        const result = await circuitBreaker.execute(mockAction);
        expect(result).toEqual('Success');
    });

    it('should transition back to open state if trial fails during halfOpenTimeout', async () => {
        const circuitBreaker = createCircuitBreaker(3, 5000, 3000, 2);

        // Force the circuit breaker into the open state
        await circuitBreaker.execute(mockFailedAction);
        await circuitBreaker.execute(mockFailedAction);
        await circuitBreaker.execute(mockFailedAction);

        // Wait for resetTimeout duration
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Attempting another action that fails should transition back to open state
        await expect(circuitBreaker.execute(mockFailedAction)).rejects.toThrow('Circuit is open. Try again later.');
    });

    it('should transition back to closed state after successful trials during halfOpenTimeout', async () => {
        const circuitBreaker = createCircuitBreaker(3, 5000, 3000, 2);

        // Force the circuit breaker into the open state
        await circuitBreaker.execute(mockFailedAction);
        await circuitBreaker.execute(mockFailedAction);
        await circuitBreaker.execute(mockFailedAction);

        // Wait for resetTimeout duration
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Attempting successful actions during halfOpenTimeout should transition back to closed state
        await circuitBreaker.execute(mockAction);
        await circuitBreaker.execute(mockAction);
        await circuitBreaker.execute(mockAction);

        // Circuit should be closed now, and the action should succeed
        const result = await circuitBreaker.execute(mockAction);
        expect(result).toEqual('Success');
    });

    it('should handle delayed actions', async () => {
        const circuitBreaker = createCircuitBreaker();

        // Perform a delayed action that should still succeed
        const result = await circuitBreaker.execute(mockDelayedAction);
        expect(result).toEqual('Success');
    });
});
