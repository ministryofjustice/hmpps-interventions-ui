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
    text: 'Please be advised that Refer & Monitor will be offline from 6pm on Friday 20th March until 8am on Monday 23rd March, due to planned maintenance being carried out in nDelius.',
  },
}
export default content
