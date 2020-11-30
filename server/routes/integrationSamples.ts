import CommunityApiService from '../services/communityApiService'

// fixme: this is just sample code to validate secure API access
export default function IntegrationSamplesRoutes(communityApiService: CommunityApiService) {
  return {
    viewDeliusUserSample: async (req, res) => {
      const deliusUser = await communityApiService.getUserByUsername(req.query.username)
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(deliusUser))
    },
  }
}
