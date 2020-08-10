import { COURSE_ENTITY } from '../utils/constants'
import { EventContext } from '@vtex/api'
import { Clients } from '../clients'

export async function updateLiveUsers(ctx: EventContext<Clients>) {
  const liveUsersProducts = await ctx.clients.analytics.getLiveUsers()
  console.log('LIVE USERS ', liveUsersProducts)
  await Promise.all(
    liveUsersProducts.map(async ({ slug, liveUsers }) => {
        try {
            const [savedProduct] = await ctx.clients.masterdata.searchDocuments<{
                id: string
                count: number
                slug: string
              }>({
                dataEntity: COURSE_ENTITY,
                fields: ['count', 'id', 'slug'],
                pagination: {
                  page: 1,
                  pageSize: 1,
                },
                schema: 'v1',
                where: `slug=${slug}`,
              })
           console.log('SAVED PRODUCT', savedProduct)

            await ctx.clients.masterdata.createOrUpdateEntireDocument({
                dataEntity: COURSE_ENTITY,
                fields: {
                count: liveUsers,
                slug,
                },
                id: savedProduct?.id,
            })
        } catch (e) {
            console.log(`Failed to update product ${slug}`)
            console.log(e)
        }       
    })
  )
  return true
}