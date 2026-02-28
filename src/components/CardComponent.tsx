interface cardContentProps {
    operatingSystem: string;
    antivirus: string;
    ram: string;
    storage: string;
}

function CardComponent({
    cardContent,
    number,
    setActiveLog,
    scanning,
}: {
    cardContent: cardContentProps;
    number: number;
    setActiveLog: React.Dispatch<React.SetStateAction<number>>;
    scanning: boolean;
}) {
    return (
        <div className="w-full border border-primary rounded-md px-2 py-1 bg-gray-600/30 hover:shadow-lg transition">
            <div className="underline font-semibold text-center text-lg">
                Virtual Machine {number + 1}
            </div>
            <div className="grid grid-cols-2">
                <div>Operating System</div>
                <div className="font-semibold">{cardContent.operatingSystem}</div>
                <div>Antivirus</div>
                <div className="font-semibold">{cardContent.antivirus}</div>
                <div>RAM</div>
                <div className="font-semibold">{cardContent.ram}</div>
                <div>Storage</div>
                <div className="font-semibold">{cardContent.storage}</div>
                <div
                    onClick={() => {
                        if (scanning) {
                            setActiveLog(number + 1);
                        }
                    }}
                    className={
                        scanning
                            ? "border w-fit px-2 mt-2 py-1 rounded-sm bg-blue-500/60 font-semibold cursor-pointer hover:bg-blue-500 transition"
                            : "border w-fit px-2 mt-2 py-1 rounded-sm bg-gray-500/60 font-semibold cursor-not-allowed hover:bg-gray-500 transition"
                    }
                >
                    View Logs
                </div>
            </div>
        </div>
    );
}