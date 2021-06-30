export interface DeliusStaffDetails {
  username: string
  teams?: DeliusTeam[]
}

export interface DeliusTeam {
  telephone?: string | null
  emailAddress?: string | null
  startDate?: string | null
  endDate?: string | null
}
