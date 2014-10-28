class Order < ActiveRecord::Base
  validates_presence_of :address, :city, :state
  belongs_to :listing
  belongs_to :buyer, class_name: "User"
  belongs_to :seller, class_name: "User"
end
