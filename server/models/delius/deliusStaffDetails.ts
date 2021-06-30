export interface DeliusStaffDetails {
  username: string
  teams?: DeliusTeam[]
}

export interface DeliusTeam {
  telephone?: string | null
  emailAddress?: string | null
  startDate: string
  endDate?: string | null
}
