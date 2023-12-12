export type Attended = 'yes' | 'no' | null

export default interface AppointmentAttendance {
  didSessionHappen: boolean | null
  attended: Attended
  additionalAttendanceInformation?: string | null
  attendanceFailureInformation: string | null
}
