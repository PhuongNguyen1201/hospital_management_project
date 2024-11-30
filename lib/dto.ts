import 'server-only'
import { UserType } from '@/types'
import { getUserByEmail } from './Data/user/user'
 
function canSeeUsername(viewer: UserType) {
  return true
}
 
// function canSeePhoneNumber(viewer: UserType, team: string) {
//   return viewer.role || team === viewer.team
// }
 
export async function getProfileDTO(slug: string) {
  // const data = await db.query.users.findMany({
  //   where: eq(users.slug, slug),
  //   // Return specific columns here
  // })
 
  const currentUser: UserType = getUserByEmail(user.id)
 
  // Or return only what's specific to the query here
  return {
    username: canSeeUsername(currentUser) ? user.username : null,
    phonenumber: canSeePhoneNumber(currentUser, user.team)
      ? user.phonenumber
      : null,
  }
}