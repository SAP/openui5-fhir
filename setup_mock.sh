git clone https://github.com/hapifhir/hapi-fhir-jpaserver-starter.git hapi-fhir-jpaserver
cd hapi-fhir-jpaserver
#checkout specific commit to stabilize pipeline
git checkout a85beaf
sed -i -e 's/config.addAllowedHeader("Origin");/config.addAllowedHeader("Origin");\nconfig.addAllowedHeader("cache-control");\nconfig.addAllowedHeader("Prefer");\nconfig.addAllowedHeader("If-Match");/g' src/main/java/ca/uhn/fhir/jpa/starter/JpaRestfulServer.java
sed -i -e 's/"PATCH")/"PATCH", "HEAD")/g' src/main/java/ca/uhn/fhir/jpa/starter/JpaRestfulServer.java
sed -i -e 's/fhir_version=DSTU3/fhir_version=R4/g' src/main/resources/hapi.properties
sed -i -e 's/\/fhir/\/fhir\/R4/g' src/main/java/ca/uhn/fhir/jpa/starter/HapiProperties.java
sed -i -e 's/\/fhir\//\/fhir\/R4\//g' src/main/webapp/WEB-INF/web.xml
sed -i -e 's/server_address=http:\/\/localhost:8080\/fhir\//server_address=http:\/\/localhost:8080\/fhir\/R4\//g' src/main/resources/hapi.properties
sed -i -e 's/server.base=\/fhir/server.base=\/fhir\/R4/g' src/main/resources/hapi.properties
mvn clean install -DskipTests
docker build -t hapi-fhir-jpaserver .
docker run -p 8080:8080 -d hapi-fhir-jpaserver
bash -c 'while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost:8080)" != "200" ]]; do sleep 1; done'
cd ..
rm -rf hapi-fhir-jpaserver
curl -vX POST http://localhost:8080/fhir/R4/ -d @test/data/mockdata.json --header "Content-Type: application/json"
curl -vX POST http://localhost:8080/fhir/R4/ -d @test/data/update-patient.json --header "Content-Type: application/json"
