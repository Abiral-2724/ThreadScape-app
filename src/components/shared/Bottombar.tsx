"use client"
import { sidebarLinks } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import { usePathname} from "next/navigation";

export default function Bottombar() {
   // const router = useRouter();
    const pathname = usePathname();
    return (
        <div>
            <section className="bottombar">
                <div className="bottombar_container">
                {sidebarLinks.map((link) => {
                        const isActive =
                            (pathname.includes(link.route) &&
                                link.route &&
                                link.route.length > 1) ||
                            pathname === link.route;
                        return (
                            <div key={link.label}>
                                <Link
                                    href={link.route}
                                    className={`bottombar_link ${
                                        isActive && `bg-primary-500`
                                    }`}
                                >
                                    <Image
                                        src={link.imgURL}
                                        alt={link.label}
                                        width={24}
                                        height={24}
                                    />
                                    <p className="text-subtle-medium text-light-1 max-lg:hidden">
                                        {link.label}
                                    </p>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}