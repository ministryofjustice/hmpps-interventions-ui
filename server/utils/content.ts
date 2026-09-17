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
    title: 'Important',
    subHeading: 'Planned maintenance',
    /*
     * To turn on banner: uncomment and modify the content in below "text: 'content'" line
     * To turn off the banner: remove or comment out below "text: xxx" line
     */
    text: 'Refer and monitor an intervention will be unavailable between 9am and 1pm on Friday 18 September. This is due to a database upgrade to resolve a security vulnerability.',
  },
}
export default content
