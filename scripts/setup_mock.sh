git clone https://github.com/hapifhir/hapi-fhir-jpaserver-starter.git hapi-fhir-jpaserver
cd hapi-fhir-jpaserver
#checkout specific commit to stabilize pipeline
git checkout b30e78ccc322dcc4be29cc5d89b9869f9d7315b6
sed -i -e 's/config.addAllowedHeader("Origin");/config.addAllowedHeader("Origin");config.addAllowedHeader("cache-control");config.addAllowedHeader("Prefer");config.addAllowedHeader("If-Match");/g' src/main/java/ca/uhn/fhir/jpa/starter/JpaRestfulServer.java
sed -i -e 's/"PATCH")/"PATCH", "HEAD")/g' src/main/java/ca/uhn/fhir/jpa/starter/JpaRestfulServer.java
sed -i -e 's/\/fhir\//\/fhir\/R4\//g' src/main/webapp/WEB-INF/web.xml
sed -i -e 's/server_address=http:\/\/localhost:8080\/hapi-fhir-jpaserver\/fhir\//server_address=http:\/\/localhost:8080\/fhir\/R4\//g' src/main/resources/hapi.properties
sed -i -e 's/<contextPath>\/hapi-fhir-jpaserver<\/contextPath>/<contextPath>\/<\/contextPath>/g' pom.xml
sed -i -e 's/\/var\/lib\/jetty\/webapps\/hapi-fhir-jpaserver.war/\/var\/lib\/jetty\/webapps\/root.war/g' Dockerfile
mvn clean install -DskipTests
docker build -t hapi-fhir-jpaserver .
docker run -p 8080:8080 -d hapi-fhir-jpaserver
bash -c 'while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost:8080)" != "200" ]]; do sleep 1; done'
cd ..
rm -rf hapi-fhir-jpaserver
curl -vX POST http://localhost:8080/fhir/R4/ -d @test/data/mockdata.json --header "Content-Type: application/json"
curl -vX POST http://localhost:8080/fhir/R4/ -d @test/data/update-patient.json --header "Content-Type: application/json"
