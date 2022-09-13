import {useMediaQuery} from "react-responsive";

export function useIsPhone(): boolean {
  return useMediaQuery({query: '(max-width: 767px)'});
}