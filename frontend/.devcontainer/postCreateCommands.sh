#Set yarn version
corepack enable
yarn set version berry

yarn install

#Copy .env files
cp apps/dashboard/.env.example apps/dashboard/.env 
cp apps/point-of-sale/.env.example apps/point-of-sale/.env

yarn build-libraries
