import { useAppDispatch, useAppSelector } from "../StoreHooks";
import { setProfileSlice } from "./ProfileSlice";
import type { Profile } from "./ProfileSlice";
export function useProfile(): [
    profile: Profile,
    setProfile: (profile: Profile) => void
] {
    const profile = useAppSelector((state) => state.profile)
    const dispatch = useAppDispatch()
    const setProfile = (profile: Profile) => {
        const profileAction = setProfileSlice(profile);
        dispatch(profileAction);
    };
  
    return [profile, setProfile];
}