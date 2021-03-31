export default class Duration {
  constructor(readonly seconds: number) {}

  static fromUnits(hours: number, minutes: number, seconds: number): Duration {
    return new Duration(hours * 3600 + minutes * 60 + seconds)
  }

  // The hours value displayed for this duration on a stopwatch
  // that displays durations in hours, minutes, and seconds.
  get stopwatchHours(): number {
    return Math.floor(this.seconds / 3600)
  }

  // The minutes value displayed for this duration on a stopwatch
  // that displays durations in hours, minutes, and seconds.
  get stopwatchMinutes(): number {
    return Math.floor((this.seconds % 3600) / 60)
  }

  // The seconds value displayed for this duration on a stopwatch
  // that displays durations in hours, minutes, and seconds.
  get stopwatchSeconds(): number {
    return this.seconds % 60
  }
}
