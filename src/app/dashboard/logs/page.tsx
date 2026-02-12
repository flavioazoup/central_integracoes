import { getRecentLogs } from '@/server/queries/logs'
import { formatDistanceToNow } from 'date-fns'
import { AlertCircle, Info, AlertTriangle, XCircle } from 'lucide-react'

export default async function LogsPage() {
    const logs = await getRecentLogs()

    const getIcon = (level: string) => {
        switch (level) {
            case 'error':
                return <XCircle className="h-5 w-5 text-red-500" />
            case 'warn':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />
            case 'info':
                return <Info className="h-5 w-5 text-blue-500" />
            default:
                return <AlertCircle className="h-5 w-5 text-gray-500" />
        }
    }

    const getBgColor = (level: string) => {
        switch (level) {
            case 'error':
                return 'bg-red-50'
            case 'warn':
                return 'bg-yellow-50'
            case 'info':
                return 'bg-blue-50'
            default:
                return 'bg-gray-50'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Logs</h1>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">System Logs</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Recent system events and errors
                    </p>
                </div>
                <div className="border-t border-gray-200">
                    <ul role="list" className="divide-y divide-gray-200">
                        {logs.length === 0 ? (
                            <li className="px-4 py-4 sm:px-6 text-center text-sm text-gray-500">
                                No logs found.
                            </li>
                        ) : (
                            logs.map((log) => (
                                <li
                                    key={log.id}
                                    className={`px-4 py-4 sm:px-6 hover:bg-gray-50 ${getBgColor(log.level)}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-0.5">{getIcon(log.level)}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-900 uppercase">
                                                    {log.level}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDistanceToNow(new Date(log.createdAt), {
                                                        addSuffix: true,
                                                    })}
                                                </p>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-700">{log.message}</p>
                                            {log.details && (
                                                <details className="mt-2">
                                                    <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-900">
                                                        View details
                                                    </summary>
                                                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                                        {JSON.stringify(log.details, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    )
}
