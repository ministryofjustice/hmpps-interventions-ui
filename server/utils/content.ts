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
    subHeading: 'Planned maintenance',
    /*
     * To turn on banner: uncomment and modify the content in below "text: 'content'" line
     * To turn off the banner: remove or comment out below "text: xxx" line
     */
    text: 'Refer and monitor an intervention will be unavailable between 3pm and 6pm on Friday 23 October. This is due to planned maintenance.',
  },
}
export default content
