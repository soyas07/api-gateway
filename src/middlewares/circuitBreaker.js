/**
 * Circuit Breaker (closed, open, half-open) states
 * 
 * @param {Number} failureThreshold 
 * @param {Number} resetTimeout 
 * @param {Number} halfOpenTimeout 
 * @param {Number} trialThreshold 
 * @returns 
 */
const createCircuitBreaker = (failureThreshold = 4, resetTimeout = 10000, halfOpenTimeout = 5000, trialThreshold = 3) => {
    let failureCount = 0;
    let isCircuitOpen = false;
    let isHalfOpen = false;
    let lastFailureTime = null;
    let trialCount = 0;
    let halfOpenTimer = null;
  
    const execute = async (action) => {
        console.log(failureCount);
        if (isCircuitOpen) {
            return Promise.reject(new Error('Circuit is open. Try again later.'));
        }
    
        if (isHalfOpen) {
            // In the half-open state, allow a limited number of trial requests
            try {
                console.log('doing trial when half open state')
                const result = await action();
                trialCount++;
                if (trialCount >= trialThreshold) {
                    // If trial requests are successful, transition to closed state
                    isHalfOpen = false;
                    reset();
                }
            
                return result;
            } catch (error) {
                // If trial request fails, transition back to open state
                handleFailure();
                return Promise.reject(error);
            }
        }
    
        try {
            const result = await action();
            reset();
            return result;
        } catch (error) {
            handleFailure();
            return Promise.reject(error);
        }
    };
    
    const handleFailure = () => {
        failureCount++;

        if (failureCount >= failureThreshold) {
            isCircuitOpen = true;
            lastFailureTime = Date.now();
    
            setTimeout(() => {
                console.log('half open state');
                // Transition to half-open state after the resetTimeout
                isHalfOpen = true;
                isCircuitOpen = false;
                trialCount = 0;
                halfOpenTimer = setTimeout(() => {
                    // Transition back to open state if no successful trials during halfOpenTimeout
                    console.log('open state');
                    isHalfOpen = false;
                    isCircuitOpen = false;
                    reset();
                }, halfOpenTimeout);
            }, resetTimeout);
        }
    };
  
    const reset = () => {
        failureCount = 0;
        lastFailureTime = null;
        clearTimeout(halfOpenTimer);
    };

    return { execute }
};

export default createCircuitBreaker;