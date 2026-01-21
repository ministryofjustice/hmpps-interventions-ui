export interface ServiceOutageBanner {
  title: string
  subHeading: string
  text?: string
}

export interface Content {
  serviceOutageBanner: ServiceOutageBanner
}

const content: Content = {
  serviceOutageBanner: {
    title: 'Downtime',
    subHeading: 'Planned Downtime',
    // to turn off the banner remove or comment out line below
    text: 'Refer and monitor an intervention will be unavailable between 5pm on Friday 23 January and 8am on Monday 26 January. This is due to planned maintenance in NDelius.',
  },
}
export default content
