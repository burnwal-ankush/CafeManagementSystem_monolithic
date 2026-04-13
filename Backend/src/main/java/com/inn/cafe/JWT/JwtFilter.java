package com.inn.cafe.JWT;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    JWTUtils jwtUtils;

    @Autowired
    CustomerUsersDetailService customerUsersDetailService;

    private Claims claims = null;
    private String userName = null;
    @Override
    protected void doFilterInternal(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, FilterChain filterChain) throws ServletException, IOException {

        if(httpServletRequest.getServletPath().matches("/user/signup|/user/login|/user/forgotPassword")){
            filterChain.doFilter(httpServletRequest,httpServletResponse);
        }
        else {
            String authorizedHeader = httpServletRequest.getHeader("Authorization");
            String token = null;
            String currentUserName = null;
            Claims currentClaims = null;

            if(authorizedHeader!= null && authorizedHeader.startsWith("Bearer "))
            {
                token = authorizedHeader.substring(7);
                try {
                    currentUserName = jwtUtils.extractUsername(token);
                    currentClaims = jwtUtils.extractAllClaims(token);
                } catch (Exception e) {
                    // Invalid token — continue without authentication
                }
            }

            if(currentUserName != null) {
                userName = currentUserName;
                claims = currentClaims;
            }

            if(currentUserName!=null && SecurityContextHolder.getContext().getAuthentication()==null)
            {
                UserDetails userDetails = customerUsersDetailService.loadUserByUsername(currentUserName);
                if(jwtUtils.validateToken(token,userDetails))
                {
                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null,
                                    userDetails.getAuthorities());
                    usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().
                            buildDetails(httpServletRequest));

                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);

                }
            }
            filterChain.doFilter(httpServletRequest,httpServletResponse);
        }
    }

    public boolean isAdmin()
    {
        return "admin".equalsIgnoreCase((String) claims.get("role"));
    }

    public boolean isUser()
    {
        return "user".equalsIgnoreCase((String) claims.get("role"));
    }

    public String getCurrentUser()
    {
        return userName;
    }


}
