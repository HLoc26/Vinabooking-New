import useUserProfileInfo from "../../hooks/useUserProfileInfo";
import UserContext from "./context";

const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const userProfileInfo = useUserProfileInfo();
	return <UserContext.Provider value={userProfileInfo}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
