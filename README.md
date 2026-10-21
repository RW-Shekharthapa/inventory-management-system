# inventory-management-system

Angular frontend, Spring Boot backend, MySQL (H2 in-memory when `JDBC_URL` is unset).

## Local
`cd backend; ./mvnw spring-boot:run` and `cd frontend; npm start` → http://localhost:4200

## Deploy to EKS
The frontend nginx proxies `/api` to the `backend` Service, so only the frontend is exposed (via ALB).

```sh
ACR=<ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com
aws ecr create-repository --repository-name inventory-backend
aws ecr create-repository --repository-name inventory-frontend
aws ecr get-login-password | docker login --username AWS --password-stdin $ACR

docker build -t $ACR/inventory-backend:latest backend && docker push $ACR/inventory-backend:latest
docker build -t $ACR/inventory-frontend:latest frontend && docker push $ACR/inventory-frontend:latest

kubectl apply -f k8s/inventory.yaml   # after replacing the image placeholders
kubectl -n inventory create secret generic inventory-db \
  --from-literal=JDBC_URL='jdbc:mysql://<rds-endpoint>:3306/inventory' \
  --from-literal=DB_USER=<user> --from-literal=DB_PASSWORD=<password>
kubectl -n inventory get ingress   # ALB hostname
```

Prereqs: a MySQL database (RDS in the cluster's VPC, security group open to the nodes on 3306) and the AWS Load Balancer Controller installed.
