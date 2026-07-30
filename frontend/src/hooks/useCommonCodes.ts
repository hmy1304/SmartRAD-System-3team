import { useEffect, useState } from "react";
import { fetchCommonCodes, CommonCode } from "@/services/commonCodeService";

// 간단한 인메모리 캐시 (세션 동안만 유지)
const codesCache: Record<string, CommonCode[]> = {};

export function useCommonCodes(groupCodes: string[]) {
  const [codes, setCodes] = useState<Record<string, CommonCode[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function loadCodes() {
      setIsLoading(true);
      const newCodes: Record<string, CommonCode[]> = { ...codesCache };
      let hasChanges = false;
      
      try {
        for (const group of groupCodes) {
          if (!newCodes[group]) {
            const fetched = await fetchCommonCodes(group);
            const activeCodes = fetched.filter(c => c.isActive); // 활성화된 코드만
            newCodes[group] = activeCodes;
            codesCache[group] = activeCodes;
            hasChanges = true;
          }
        }
        
        if (isMounted) {
          setCodes(newCodes);
        }
      } catch (error) {
        console.error("Failed to load common codes:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCodes();
    
    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(groupCodes)]);

  return { codes, isLoading };
}
