import { LogOut } from 'lucide-react';

export function Header () {
    return (
        <header className="sticky top-0 z-50 bg-[#343a40] h-16 flex items-center px-4 py-6 justify-between shadow-xl">
            <h1 className="text-white text-lg font-bold">Book A Room</h1>

            <div className="flex">

                <h2 className="text-white text-lg font-bold mx-4">Kroekkan</h2>

                <button className="bg-white rounded-full px-1 cursor-pointer hover:bg-gray-200">
                  <LogOut size={20} className="shrink-0" />
                </button>

            </div>

        </header>
    )
}