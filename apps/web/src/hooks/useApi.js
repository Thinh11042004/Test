import { useState, useEffect, useCallback } from 'react';
import { hrApi } from '../services/api';

const getPayload = (response) => response?.data?.data ?? response?.data ?? null;

export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await hrApi.getEmployees();
      setEmployees(getPayload(response) ?? []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const createEmployee = useCallback(async (data) => {
    try {
      setSaving(true);
      const response = await hrApi.createEmployee(data);
      const created = getPayload(response);
      if (created) {
        setEmployees((prev) => [...prev, created]);
      }
      return created;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateEmployee = useCallback(async (id, updates) => {
    try {
      setSaving(true);
      const response = await hrApi.updateEmployee(id, updates);
      const updated = getPayload(response);
      if (updated) {
        setEmployees((prev) => prev.map((employee) => (employee.id === id ? updated : employee)));
      }
      return updated;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteEmployee = useCallback(async (id) => {
    try {
      setSaving(true);
      await hrApi.deleteEmployee(id);
      setEmployees((prev) => prev.filter((employee) => employee.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    employees,
    loading,
    saving,
    error,
    refresh: fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
};

export const useCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchCandidates = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const response = await hrApi.getCandidates(filters);
      setCandidates(getPayload(response) ?? []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const createCandidate = useCallback(async (data) => {
    try {
      setSaving(true);
      const response = await hrApi.createCandidate(data);
      const created = getPayload(response);
      if (created) {
        setCandidates((prev) => [...prev, created]);
      }
      return created;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateCandidate = useCallback(async (id, updates) => {
    try {
      setSaving(true);
      const response = await hrApi.updateCandidate(id, updates);
      const updated = getPayload(response);
      if (updated) {
        setCandidates((prev) => prev.map((candidate) => (candidate.id === id ? updated : candidate)));
      }
      return updated;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteCandidate = useCallback(async (id) => {
    try {
      setSaving(true);
      await hrApi.deleteCandidate(id);
      setCandidates((prev) => prev.filter((candidate) => candidate.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    candidates,
    loading,
    saving,
    error,
    refresh: fetchCandidates,
    createCandidate,
    updateCandidate,
    deleteCandidate,
  };
};

export const useJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchJobs = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const response = await hrApi.getJobs(filters);
      setJobs(getPayload(response) ?? []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const createJob = useCallback(async (data) => {
    try {
      setSaving(true);
      const response = await hrApi.createJob(data);
      const created = getPayload(response);
      if (created) {
        setJobs((prev) => [...prev, created]);
      }
      return created;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateJob = useCallback(async (id, updates) => {
    try {
      setSaving(true);
      const response = await hrApi.updateJob(id, updates);
      const updated = getPayload(response);
      if (updated) {
        setJobs((prev) => prev.map((job) => (job.id === id ? updated : job)));
      }
      return updated;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteJob = useCallback(async (id) => {
    try {
      setSaving(true);
      await hrApi.deleteJob(id);
      setJobs((prev) => prev.filter((job) => job.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    jobs,
    loading,
    saving,
    error,
    refresh: fetchJobs,
    createJob,
    updateJob,
    deleteJob,
  };
};

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await hrApi.getAnalytics();
      setAnalytics(getPayload(response));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, error, refresh: fetchAnalytics };
};

export const useWorkforceInsight = () => {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsight = useCallback(async () => {
    try {
      setLoading(true);
      const response = await hrApi.getWorkforceInsight();
      setInsight(getPayload(response));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsight();
  }, [fetchInsight]);

  return { insight, loading, error, refresh: fetchInsight };
};
