                  <BarChart data={campaignData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} hide={true} />
                    <Tooltip />
                    <Bar dataKey="value" barSize={25} radius={[5, 5, 0, 0]}>
                      {
                        campaignData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.name === 'Mar' ? '#F28C6A' : '#d1d5db'} />
                        ))
                      }
                      <LabelList dataKey="percentage" position="top" formatter={(value: number) => `${value}%`} style={{ fontSize: '12px', fill: '#6b7280' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Delivered Card */}
              <div className="flex flex-col items-center justify-center border-r border-gray-200">
                <p className="text-sm text-gray-600">Delivered</p>
              {/* Opened Card */}
              <div className="flex flex-col items-center justify-center border-r border-gray-200">
                <p className="text-sm text-gray-600">Opened</p>
              {/* Clicked Card */}
              <div className="flex flex-col items-center justify-center border-r border-gray-200">
                <p className="text-sm text-gray-600">Clicked</p>
              {/* Subscribe Card */}
              <div className="flex flex-col items-center justify-center">
                <p className="text-sm text-gray-600">Subscribe</p>
              </div>
            </div>
          </div> 