export type Attended = 'yes' | 'no' | 'do_not_know' | null

export default interface AppointmentAttendance {
  didSessionHappen: boolean | null
  attended: Attended
  additionalAttendanceInformation?: string | null
  attendanceFailureInformation: string | null
}