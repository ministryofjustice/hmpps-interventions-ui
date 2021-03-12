package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.filters

import org.slf4j.MDC
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Component
class MdcLogEnhancerFilter : OncePerRequestFilter() {
  override fun doFilterInternal(req: HttpServletRequest, res: HttpServletResponse, chain: FilterChain) {
    // this is the place to add more request specific log fields...

    MDC.put("hostname", req.localAddr)
    try {
      chain.doFilter(req, res)
    } finally {
      // and don't forget to clear them out at the end of each request!
      MDC.remove("hostname")
    }
  }
}
