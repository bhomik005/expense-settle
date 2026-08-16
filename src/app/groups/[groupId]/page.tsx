import { notFound } from 'next/navigation'
import { formatCents } from '@/lib/money'
import { settleUp } from '@/lib/settle'
import { getGroup } from './data'

export default async function GroupPage(props: PageProps<'/groups/[groupId]'>) {
  const { groupId } = await props.params
  const group = getGroup(groupId)

  if (!group) {
    notFound()
  }

  const payments = settleUp(group.balances)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          {group.name}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {group.members.length} members
        </p>
      </div>

      <section>
        <h2 className="text-lg font-medium text-black dark:text-zinc-50">Settlement summary</h2>
        {payments.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Everyone is settled up.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {payments.map((payment, index) => (
              <li
                key={`${payment.from}-${payment.to}-${index}`}
                className="flex items-center justify-between rounded-lg border border-black/[.08] px-4 py-3 dark:border-white/[.145]"
              >
                <span className="text-sm text-black dark:text-zinc-50">
                  <strong>{payment.from}</strong> owes <strong>{payment.to}</strong>
                </span>
                <span className="font-mono text-sm text-black dark:text-zinc-50">
                  {formatCents(payment.cents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
