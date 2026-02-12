import { getRecentJobs } from '@/server/queries/jobs'
import { formatDistanceToNow } from 'date-fns'
import { Activity, AlertCircle, CheckCircle2, Clock, XCircle, Building2 } from 'lucide-react'

export default async function SyncStatusPage() {
    const jobs = await getRecentJobs()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Sync Status</h1>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Jobs</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Overview of recent synchronization activities.</p>
                </div>
                <div className="border-t border-gray-200">
                    <ul role="list" className="divide-y divide-gray-200">
                        {jobs.length === 0 ? (
                            <li className="px-4 py-4 sm:px-6 text-center text-sm text-gray-500">No jobs found.</li>
                        ) : (
                            jobs.map((job) => (
                                <li key={job.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="mr-4 flex-shrink-0">
                                                {job.status === 'completed' && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                                                {job.status === 'failed' && <XCircle className="h-6 w-6 text-red-500" />}
                                                {job.status === 'processing' && <Activity className="h-6 w-6 text-blue-500 animate-pulse" />}
                                                {job.status === 'pending' && <Clock className="h-6 w-6 text-gray-400" />}
                                            </div>
                                            <div>
                                                <p className="truncate text-sm font-medium text-indigo-600">{job.type.toUpperCase()}</p>
                                                <p className="flex items-center text-sm text-gray-500">
                                                    <span className="truncate">{job.integration.name} ({job.integration.provider})</span>
                                                </p>
                                                {job.integration.customer && (
                                                    <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                        <Building2 className="h-3 w-3" />
                                                        <span>{job.integration.customer.name}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <p className="text-sm text-gray-900 capitalize">
                                                {job.status}
                                            </p>
                                            <p className="mt-1 flex items-center text-xs text-gray-500">
                                                {job.completedAt ? (
                                                    `Completed ${formatDistanceToNow(new Date(job.completedAt), { addSuffix: true })}`
                                                ) : (
                                                    `Started ${formatDistanceToNow(new Date(job.startedAt), { addSuffix: true })}`
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    {job.message && (
                                        <div className={`mt-2 text-xs p-2 rounded ${job.status === 'failed'
                                                ? 'text-red-600 bg-red-50'
                                                : 'text-green-600 bg-green-50'
                                            }`}>
                                            {job.message}
                                        </div>
                                    )}
                                </li>
                            ))
                        )}

                    </ul>
                </div>
            </div>
        </div>
    )
}
