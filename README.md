# We are the Champions!

This is my submission for Govtech's 2025 TAP assignment.

This application is being hosted on vercel and can be accessed below.<br>
https://we-are-the-champions-sigma.vercel.app/

## Assumptions & Intepretation
1) Each team name should be unique, but teamA and teama, are considered as the different team names. This is accepted behaviour.
2) Leaderboards will show teams that are qualified based on the current match result inputs. So at the start, if all teams are added but not any match results, it will show the earliest registered team to have qualified based on conditions given.
3) Support only 1 round of the competition, so only 12 teams and 30 match results are accepted. Afterwards, the **Add** button are disabled.
4) Clear all previously entered data is intepreted that the Delete button will clear all match results and team data. Not a requirement to support single data deletion. Single data refers to 1 team record or 1 match result record.
5) Vercel is accepted since it is a cloud provider.
6) Implement an authentication mechnism means I can use services like Clerk or Supabase since I just have to integrate to my application.


### Steps to run locally
My assumption is that since the application is deployed, a docker file to run the source code is not needed. However if there is a need to run locally still, please email me and I will share the required API keys.

```
git clone git@github.com:maxng17/we_are_the_champions.git

# Manually create .env file with required API keys.

npm run dev
```

## Architecture decisions

### Monolithic
Monolithic design since the application is on a smaller scale, so 1 repository for both backend and frontend simplifies development. Since NextJS is a framework that supports fullstack application, monolithic approach seems acceptable.

Alternative is using microservices such as API Gateway with Lambdas on AWS for backend development. However that much complexity is not needed on a smaller project.

### Vercel 
Vercel is compatible with NextJS so it makes deployment easier for both backend and frontend. It also provides an automatic CI/CD pipeline to quicken development and also ensure better coding standards through eslint checks. 

It is also compatible with services such as Neon Postgres and Clerk.

### NextJS
Chosen over React since it is a full stack application that can be used for both backend and frontend development. Also, wanted to try a new framework.


## Features
This application supports the **must have** features listed below: 
1) A multi-line input for **Team** and **Match Result** data.<br>
2) Leaderboards for both groups based on the current match results enterd.
3) Retriving data for a specific team.
4) Users can also select data to edit. (Can only edit 1 line of data at a time)
5) Users can clear all previously entered data.
6) Logs for all data changes. (Add data, edit data, delete all data)
7) Application secured against common web vulnerabilities. (As much as I could)

The following **bonus requirements** have met too: 
1) Deployed onto Vercel.
2) Data persist across reboots.
3) Invalid input handled. (As best as I could)
4) Hint to users where the error in input is. (As best as I could, but no correction suggestion)
5) Authentication system for different users (No different roles support)
6) Static code analysis done. Scan result in **eslint-report.json** file


## Teck Stack

This application was created using:
- Backend: NextJS
- Frontend: NextJS
- CI/CD: Vercel
- Deployment/Hosting: Vercel
- Database: Neon Postgres
- Authentication Service: Clerk

