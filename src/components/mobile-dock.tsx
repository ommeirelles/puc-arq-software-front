import { CartService } from "@src/services/cart";
import { AuthService } from "@src/services/auth";
import { useNavigate } from "react-router";

interface MobileDockProps {
  onOpenFilters: () => void;
  onScrollToTop: () => void;
}

export function MobileDock({ onOpenFilters, onScrollToTop }: MobileDockProps) {
  const cartApi = CartService.getInstance();
  const authApi = AuthService.getInstance();
  const navigate = useNavigate();

  const logout = async () => {
    await authApi.logout();
    cartApi.clearCart();
    navigate("/");
  };

  return (
    <div className="dock lg:hidden">
      <button onClick={logout}>
        <span className="material-symbols-outlined size-[1.2em]">logout</span>
        <span className="dock-label">Logout</span>
      </button>
      <button onClick={onScrollToTop}>
        <span className="material-symbols-outlined size-[1.2em]">
          arrow_upward
        </span>
        <span className="dock-label">Top</span>
      </button>
      <button onClick={onOpenFilters}>
        <span className="material-symbols-outlined size-[1.2em]">
          filter_list
        </span>
        <span className="dock-label">Filters</span>
      </button>
    </div>
  );
}
