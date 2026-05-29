
export default function Card({ title, description }: { title: string; description: string }) {
    return (
        <div className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow-md w-48">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
        </div>
    );
}