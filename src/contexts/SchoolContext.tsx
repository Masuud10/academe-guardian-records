import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface School {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  owner_id?: string;
  principal_id?: string;
  created_at?: string;
  updated_at?: string;
  curriculum_type?: string;
}

interface SchoolContextType {
  currentSchool: School | null;
  schools: School[];
  isLoading: boolean;
  error: string | null;
  setCurrentSchool: (school: School | null) => void;
  fetchSchools: () => Promise<void>;
  refetch: () => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error("useSchool must be used within a SchoolProvider");
  }
  return context;
};

export const SchoolProvider = ({ children }: { children: ReactNode }) => {
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const fetchInProgressRef = useRef(false);
  const schoolsCacheRef = useRef<{ [key: string]: School[] }>({});
  const lastFetchRef = useRef<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  console.log("🏫 SchoolProvider: Initializing with user:", {
    hasUser: !!user,
    userRole: user?.role,
    userSchoolId: user?.school_id,
    userEmail: user?.email,
  });

  const getCacheKey = (userRole: string, schoolId?: string) => {
    return `school_${schoolId}`;
  };

  const fetchSchools = useCallback(async () => {
    if (!user) {
      console.log("🏫 SchoolProvider: No authenticated user, clearing state");
      setIsLoading(false);
      setSchools([]);
      setCurrentSchool(null);
      setError(null);
      return;
    }

    // Prevent multiple simultaneous fetches
    if (fetchInProgressRef.current) {
      console.log("🏫 SchoolProvider: Fetch already in progress, skipping");
      return;
    }

    const cacheKey = getCacheKey(user.role, user.school_id);
    const now = Date.now();

    // Check cache first
    if (
      schoolsCacheRef.current[cacheKey] &&
      now - lastFetchRef.current < CACHE_DURATION
    ) {
      console.log("🏫 SchoolProvider: Using cached schools data");
      const cachedSchools = schoolsCacheRef.current[cacheKey];
      setSchools(cachedSchools);
      if (cachedSchools.length === 1) {
        setCurrentSchool(cachedSchools[0]);
      }
      return;
    }

    try {
      fetchInProgressRef.current = true;
      setIsLoading(true);
      setError(null);

      console.log(
        "🏫 SchoolProvider: Fetching fresh schools for user role:",
        user.role,
        "school_id:",
        user.school_id
      );

      let schoolsData: School[] = [];

      // For system admins, fetch all schools
      if (user.role === "elimisha_admin" || user.role === "edufam_admin") {
        try {
          const result = await Promise.race([
            supabase.from("schools").select("*").order("name"),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("School fetch timed out")),
                8000
              )
            ),
          ]);

          const { data, error: fetchError } = result as {
            data: School[];
            error: Error | null;
          };

          if (fetchError) {
            console.error(
              "🏫 SchoolProvider: Admin school fetch error:",
              fetchError
            );
            throw fetchError;
          }

          schoolsData = data || [];
          console.log(
            "🏫 SchoolProvider: Fetched",
            schoolsData.length,
            "schools for admin"
          );
        } catch (error) {
          console.error("🏫 SchoolProvider: School fetch failed:", error);
          throw error;
        }
      }
      // For school-specific users, fetch their school
      else if (user.school_id) {
        try {
          const result = await Promise.race([
            supabase
              .from("schools")
              .select("*")
              .eq("id", user.school_id)
              .maybeSingle(),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("School fetch timed out")),
                8000
              )
            ),
          ]);

          const { data, error: fetchError } = result as {
            data: School | null;
            error: Error | null;
          };

          if (fetchError) {
            console.warn("🏫 SchoolProvider: School fetch error:", fetchError);
            setSchools([]);
            setCurrentSchool(null);
            setError(`Failed to fetch school: ${fetchError.message}`);
            return;
          } else if (data) {
            schoolsData = [data];
            setCurrentSchool(data);
            console.log("🏫 SchoolProvider: Fetched user school:", data.name);
          } else {
            console.warn(
              "🏫 SchoolProvider: User school not found:",
              user.school_id
            );
            setSchools([]);
            setCurrentSchool(null);
            setError(
              "Your assigned school was not found. Please contact your administrator."
            );
            return;
          }
        } catch (error) {
          console.error("🏫 SchoolProvider: School fetch failed:", error);
          setSchools([]);
          setCurrentSchool(null);
          setError("Failed to fetch school data. Please try again.");
          return;
        }
      } else {
        console.log("🏫 SchoolProvider: User has no school assignment");
        setSchools([]);
        setCurrentSchool(null);
        setError(null);
        return;
      }

      // Cache the results
      schoolsCacheRef.current[cacheKey] = schoolsData;
      lastFetchRef.current = now;

      setSchools(schoolsData);
    } catch (error: unknown) {
      console.error("🏫 SchoolProvider: Error fetching schools:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch schools"
      );
      setSchools([]);
      setCurrentSchool(null);
    } finally {
      setIsLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [user]);

  const refetch = async () => {
    // Clear cache and force refetch
    schoolsCacheRef.current = {};
    lastFetchRef.current = 0;
    await fetchSchools();
  };

  // Effect to fetch schools when user changes
  useEffect(() => {
    if (user?.id) {
      console.log("🏫 SchoolProvider: User authenticated, fetching schools");
      fetchSchools();
    } else {
      console.log("🏫 SchoolProvider: No user, clearing schools");
      setSchools([]);
      setCurrentSchool(null);
      setIsLoading(false);
      setError(null);
      // Clear cache when user logs out
      schoolsCacheRef.current = {};
      lastFetchRef.current = 0;
    }
  }, [user?.id, user?.role, user?.school_id, fetchSchools]);

  const value = {
    currentSchool,
    schools,
    isLoading,
    error,
    setCurrentSchool,
    fetchSchools,
    refetch,
  };

  return (
    <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>
  );
};
