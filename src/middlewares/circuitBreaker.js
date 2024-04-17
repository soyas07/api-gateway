/**
 * Circuit Breaker (closed, open, half-open) states
 * 
 * @param {Number} failureThreshold 
 * @param {Number} resetTimeout 
 * @param {Number} halfOpenTimeout 
 * @param {Number} trialThreshold 
 * @returns 
 */
const createCircuitBreaker = (failureThreshold = 3, resetTimeout = 5000, halfOpenTimeout = 3000, trialThreshold = 2) => {
    let failureCount = 0;
    let isCircuitOpen = false;
    let isHalfOpen = false;
    let lastFailureTime = null;
    let trialCount = 0;
  
    const execute = async (action) => {
        if (isCircuitOpen) {
            return Promise.reject(new Error('Circuit is open. Try again later.'));
        }
    
        if (isHalfOpen) {
            // In the half-open state, allow a limited number of trial requests
            try {
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
                // Transition to half-open state after the resetTimeout
                isHalfOpen = true;
                trialCount = 0;
                setTimeout(() => {
                    // Transition back to open state if no successful trials during halfOpenTimeout
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
    };
  
    return { execute };
};

export default createCircuitBreaker