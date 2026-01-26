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
    /*
     * To turn on banner: uncomment and modify the content in below "text: 'content'" line
     * To turn off the banner: remove or comment out below "text: xxx" line
     */
    //text: 'Refer and monitor an intervention will be unavailable between 5pm on Friday 23 January and 8am on Monday 26 January. This is due to planned maintenance in NDelius.',
  },
}
export default content
