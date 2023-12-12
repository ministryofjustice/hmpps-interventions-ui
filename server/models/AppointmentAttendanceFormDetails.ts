import AppointmentAttendance from './appointmentAttendance'

export default interface AppointmentAttendanceFormDetails extends AppointmentAttendance {
  didSessionHappen: boolean | null
}
