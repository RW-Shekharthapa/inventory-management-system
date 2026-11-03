# inventory-management-system

Angular frontend, Spring Boot backend, MySQL (H2 in-memory when `JDBC_URL` is unset).

## Local
`cd backend; ./mvnw spring-boot:run` and `cd frontend; npm start` → http://localhost:4200

## Deploy to EKS
One image: the root `Dockerfile` builds Angular into Spring Boot's `static/` folder, so Spring serves both UI and `/api`.

```powershell
$REG = "<ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com"
aws ecr create-repository --repository-name inventory
aws ecr get-login-password --region <REGION> | docker login --username AWS --password-stdin $REG

docker build -t inventory .
docker tag inventory:latest "$REG/inventory:v1"
docker push "$REG/inventory:v1"

# edit the image line in k8s/inventory.yaml, then:
kubectl apply -f k8s/inventory.yaml
kubectl -n inventory create secret generic inventory-db `
  --from-literal=JDBC_URL='jdbc:mysql://<rds-endpoint>:3306/inventory' `
  --from-literal=DB_USER=<user> --from-literal=DB_PASSWORD=<password>
kubectl -n inventory get ingress   # ALB hostname
```

Prereqs: a MySQL database (RDS in the cluster's VPC, security group open to the nodes on 3306) and the AWS Load Balancer Controller installed.
