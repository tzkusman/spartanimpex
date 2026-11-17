/**
 * Spartan Impex - Centralized In-Memory Pricing Store
 * Ensures 0ms instantaneous display of live database pricing, eliminates
 * stale client-side localStorage flash, and provides eager prefetching.
 */

let livePlans = null;
let fetchPromise = null;
const listeners = new Set();

/**
 * Eagerly prefetch live database pricing from /api/pricing.
 * Subsequent calls return the existing in-flight or completed promise.
 */
export function prefetchPricing() {
  if (livePlans) {
    return Promise.resolve(livePlans);
  }
  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = fetch(`/api/pricing?_t=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching pricing`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        livePlans = data;
        listeners.forEach((callback) => {
          try {
            callback(data);
          } catch (e) {
            console.warn('Pricing listener error:', e);
          }
        });
      }
      return data;
    })
    .catch((err) => {
      console.warn('Eager pricing prefetch warning:', err.message);
      return null;
    })
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

/**
 * Synchronously retrieves currently resolved in-memory plans.
 * Returns null if not yet resolved.
 */
export function getCachedPlans() {
  return livePlans;
}

/**
 * Updates live plans in-memory and notifies all active listeners immediately.
 * Called by the Admin Dashboard when updating plan prices.
 */
export function updateLivePlans(updatedPlans) {
  if (Array.isArray(updatedPlans) && updatedPlans.length > 0) {
    livePlans = updatedPlans;
    listeners.forEach((callback) => {
      try {
        callback(updatedPlans);
      } catch (e) {
        console.warn('Pricing listener error:', e);
      }
    });
  }
}

/**
 * Subscribes a component to live pricing updates.
 * Returns an unsubscribe function.
 */
export function subscribePricing(callback) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
