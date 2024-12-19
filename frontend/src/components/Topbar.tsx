import { SignedOut, UserButton } from "@clerk/clerk-react";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";
import { LayoutDashboardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

const Topbar = () => {

	const { isAdmin } = useAuthStore();
	console.log({ isAdmin });

	return (
		<div
			className='rounded-t-md flex items-center justify-between p-4 sticky top-0 bg-[#7096d1] backdrop-blur-md z-10'>
			<div className='flex gap-2 items-center text-3xl font-semibold logo-font text-[#081f5c]'>
				SOUND LOOM
			</div>
			<div className='flex items-center gap-4'>
				{isAdmin && (
					<Link to={"/admin"} className={cn(buttonVariants({ variant: "outline", className:"bg-[#7096d1] border-white hover:bg-[#081f5c]"}))}>
						<LayoutDashboardIcon className='size-4  mr-2' />
						Admin Dashboard
					</Link>
				)}

				<SignedOut>
					<SignInOAuthButtons />
				</SignedOut>

				<UserButton />
			</div>
		</div>
	);
};
export default Topbar;
