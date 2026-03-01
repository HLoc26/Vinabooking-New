import React from "react";
import useUserFavouriteList from "../../features/user/hooks/useUserFavouriteList";
import { IconButton } from "@mui/material";
import { StarOutlineRounded, StarRounded } from "@mui/icons-material";
import FavouritePickerModal from "../../features/user/components/FavouritePickerModal";
import useModalContext from "../../context/ModalContext/hook";
import LoginModal from "./LoginModal";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";

interface FavouriteButtonProps {
	accommodationId: string;
	className?: string;
}

const FavouriteButton: React.FC<FavouriteButtonProps> = ({ accommodationId, className }) => {
	const userInfo = useSelector((state: RootState) => state.auth.user);

	const { favouriteLists, handleAddToFavourite, handleRemoveFromFavourite } = useUserFavouriteList();

	const isFavorite = favouriteLists?.some((list) => list.items.some((item) => item.accommodationId === accommodationId)) ?? false;

	const { openModal, closeModal } = useModalContext();

	const toggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (userInfo) {
			openModal(<FavouritePickerModal accommodationId={accommodationId} onAdd={handleAddToFavourite} onRemove={handleRemoveFromFavourite} />);
		} else {
			openModal(<LoginModal onLoginSuccess={closeModal} />);
		}
	};

	return (
		<IconButton onClick={toggle} className={className} sx={{ background: "white", ":hover": { background: "white" } }}>
			{isFavorite ? <StarRounded sx={{ color: "gold" }} /> : <StarOutlineRounded />}
		</IconButton>
	);
};

export default FavouriteButton;
